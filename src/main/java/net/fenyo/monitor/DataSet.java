package net.fenyo.monitor;

import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DataSet {
    private static final Logger logger = LoggerFactory.getLogger(DataSet.class);
    private long lifetime;
    
    private final ArrayList<Instant> instants = new ArrayList<Instant>();
    private final ArrayList<String> values = new ArrayList<String>();

    public DataSet(long lifetime) {
        this.lifetime = lifetime;
    }

    public synchronized void extend(final long lifetime) {
        if (lifetime > this.lifetime) {
            this.lifetime = lifetime;
            flush();
        }
    }

    public synchronized Instant addValue(final String value, final long lifetime) {
        final Instant now = Instant.now();
        instants.add(now);
        values.add(value);
        if (lifetime != 0 && lifetime > this.lifetime) logger.warn("increasing lifetime of a dataset can lead to inconsistent dataset (lost values between recorded/displayed values)");
        if (lifetime != 0) this.lifetime = lifetime;
        flush();
        return now;
    }

    private static void flush(final List<Instant> instants, final List<String> values, long lifetime) {
        final Instant beginning = Instant.now().minus(lifetime, ChronoUnit.SECONDS);
        while (true) {
            final Iterator<Instant> it = instants.iterator();
            if (!it.hasNext()) return;
            it.next();
            if (!it.hasNext()) return;
            if (it.next().isBefore(beginning)) {
                instants.remove(0);
                values.remove(0);
            }
            return;
        }
    }

    // keep at most only one value outside of the time window
    private synchronized void flush() {
        flush(instants, values, lifetime);
    }

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

    public synchronized Data [] toArray(final long lifetime) {
        flush();

        @SuppressWarnings("unchecked")
        final List<Instant> instants = (List<Instant>) this.instants.clone();
        @SuppressWarnings("unchecked")
        final List<String> values = (List<String>) this.values.clone();

        flush(instants, values, lifetime);
        
        final Instant now = Instant.now();
        final Data [] array = new Data[instants.size()];
        for (int i = 0; i < instants.size(); i++) {
            array[i] = new Data();
            array[i].millisecondsFromNow = instants.get(i).until(now, ChronoUnit.MILLIS);
            array[i].value = values.get(i);
        }
        return array;
    }
}
