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

import sun.awt.SunHints.Value;

public class DataSet {
    private static final Logger logger = LoggerFactory.getLogger(DataSet.class);
    private final long time_window;
    
    private final List<Instant> instants = new ArrayList<Instant>();
    private final List<String> values = new ArrayList<String>();

    public DataSet(long time_window) {
        this.time_window = time_window;
    }

    public synchronized Instant addValue(final String value) {
        final Instant now = Instant.now();
        instants.add(now);
        values.add(value);
        flush();
        return now;
    }

    // keep at most only one value outside of the time window
    private void flush() {
        final Instant beginning = Instant.now().minus(time_window, ChronoUnit.SECONDS);
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
            result.append("{\"time\":" + instant.until(now, ChronoUnit.SECONDS) + ",\"value\":" + it.next() + "}");
        }
        result.append("]");
        return result.toString();
    }

    public synchronized Data [] toArray() {
        flush();
        final Instant now = Instant.now();
        final Data [] array = new Data[instants.size()];
        for (int i = 0; i < instants.size(); i++) {
            array[i] = new Data();
            array[i].secondsFromNow = instants.get(i).until(now, ChronoUnit.SECONDS);
            array[i].value = values.get(i);
        }
        return array;
    }
}
