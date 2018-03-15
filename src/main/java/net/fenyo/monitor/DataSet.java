package net.fenyo.monitor;

/*
 * Copyright 2018 Alexandre Fenyo - alex@fenyo.net - http://fenyo.net
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import java.util.*;
import java.time.*;
import java.time.temporal.*;
import org.slf4j.*;

/**
 * A set of time-ordered numeric data.
 * @author Alexandre Fenyo
 */

public class DataSet {
    private static final Logger logger = LoggerFactory.getLogger(DataSet.class);
    private long lifetime;

    private long current_index = 0;
    private final ArrayList<Long> indexes = new ArrayList<Long>();

    private final ArrayList<Instant> instants = new ArrayList<Instant>();
    private final ArrayList<String> values = new ArrayList<String>();

    /**
     * Constructor.
     * Creates a DataSet instance.
     * @param lifetime initial lifetime of data. May be increased later. Must be >= 0.
     */
    public DataSet(long lifetime) {
        this.lifetime = lifetime;
    }

    /**
     * Increase the lifetime of data in this set.
     * @param long lifetime lifetime in seconds. Must be > 0.
     */
    public synchronized void extend(final long lifetime) {
        if (lifetime > this.lifetime) {
            this.lifetime = lifetime;
            flush();
        }
    }

    /**
     * Add a data to this set and update the lifetime of the whole set. The lifetime can not be decreased.
     * @param String value String representation of the data value.
     * @param long lifetime lifetime in seconds. Must be >= 0. 0 means no lifetime change. 
     * @throws MonitorException 
     */
//    public synchronized long addValue(final String value, final long lifetime) throws MonitorException {
    public synchronized Data addValue(final String value, final long lifetime) throws MonitorException {
        final Instant now = Instant.now();
        
        // JavaScript Moment does not store nanoseconds but milliseconds, therefore we avoid having two distinct instants that correspond to the same moments.
        if (!instants.isEmpty() && now.toEpochMilli() == instants.get(instants.size() - 1).toEpochMilli()) {
            logger.warn("can not add multiple values during the same millisecond");
            return null;
        }

        if (!instants.isEmpty() && now.isBefore(instants.get(instants.size() - 1))) throw new MonitorException("current instant in the past");

        if (current_index == Long.MAX_VALUE) throw new MonitorException("index too big");
        final long idx = current_index++;
        indexes.add(idx);

        instants.add(now);
        values.add(value);
        if (lifetime > this.lifetime) {
            logger.warn("increasing lifetime of a dataset can lead to temporary inconsistent dataset (lost values between recorded/displayed values)");
            this.lifetime = lifetime;
        } else if (lifetime < this.lifetime && lifetime != 0) logger.warn("decreasing lifetime is forbidden");
        flush();

        final Data data = new Data();
        data.index = idx;
        data.instant = now.toEpochMilli();
        data.millisecondsFromNow = -1;
        data.value = value;
        return data;
    }

    /**
     * Keep only one data older than the lifetime of the whole set passed in instants and values parameters.
     * Note that this is a static method, not relative to an instance of a set.
     * @param List<Instant> instants data timestamps.
     * @param List<String> values data values.
     * @param long lifetime lifetime in seconds.
     */
    private static void flush(final List<Long> indexes, final List<Instant> instants, final List<String> values, long lifetime) {
        final Instant beginning = Instant.now().minus(lifetime, ChronoUnit.SECONDS);
        while (true) {
            final Iterator<Instant> it = instants.iterator();
            if (!it.hasNext()) return;
            it.next();
            if (!it.hasNext()) return;
            if (it.next().isBefore(beginning)) {
                indexes.remove(0);
                instants.remove(0);
                values.remove(0);
            } else return;
        }
    }

    /**
     * Keep only one data older than the lifetime of the whole set.
     * @param none.
     */
    private void flush() {
        flush(indexes, instants, values, lifetime);
    }

    /**
     * Convert the data set into a JSON representation.
     * @param none.
     */
    public synchronized String toString() {
        flush();
        final Instant now = Instant.now();
        final StringBuffer result = new StringBuffer("[");
        final Iterator<String> it = values.iterator();
        boolean first = true;
        for (final Instant instant : instants) {
            if (first) {
                result.append(",");
                first = false;
            }
            result.append("{\"time\":" + instant.until(now, ChronoUnit.MILLIS) + ",\"value\":" + it.next() + "}");
        }
        result.append("]");
        return result.toString();
    }

    /**
     * Convert the data set into an array of Data instances.
     * @param none.
     */
    public synchronized Data [] toArray(final long lifetime) {
        flush();

        @SuppressWarnings("unchecked")
        final List<Long> indexes = (List<Long>) this.indexes.clone();
        @SuppressWarnings("unchecked")
        final List<Instant> instants = (List<Instant>) this.instants.clone();
        @SuppressWarnings("unchecked")
        final List<String> values = (List<String>) this.values.clone();

        flush(indexes, instants, values, lifetime);

        final Instant now = Instant.now();
        final Data [] array = new Data[instants.size()];
        for (int i = 0; i < instants.size(); i++) {
            array[i] = new Data();
            array[i].index = indexes.get(i);
            array[i].millisecondsFromNow = instants.get(i).until(now, ChronoUnit.MILLIS);
            array[i].instant = instants.get(i).toEpochMilli();
            array[i].value = values.get(i);
        }
        return array;
    }
}
