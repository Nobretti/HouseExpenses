package com.houseexpenses.util;

import com.houseexpenses.model.Budget.BudgetPeriod;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

public final class DateUtils {

    private DateUtils() {
        // Utility class
    }

    public static LocalDate[] getDateRangeForPeriod(BudgetPeriod period, LocalDate referenceDate) {
        LocalDate startDate;
        LocalDate endDate;

        switch (period) {
            case weekly:
                startDate = referenceDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                endDate = startDate.plusDays(6);
                break;
            case monthly:
                startDate = referenceDate.withDayOfMonth(1);
                endDate = referenceDate.with(TemporalAdjusters.lastDayOfMonth());
                break;
            case annual:
                startDate = referenceDate.withDayOfYear(1);
                endDate = referenceDate.with(TemporalAdjusters.lastDayOfYear());
                break;
            default:
                throw new IllegalArgumentException("Unknown period: " + period);
        }

        return new LocalDate[]{startDate, endDate};
    }

    public static int getDaysRemaining(BudgetPeriod period, LocalDate referenceDate) {
        LocalDate[] range = getDateRangeForPeriod(period, referenceDate);
        return (int) (range[1].toEpochDay() - referenceDate.toEpochDay());
    }

    public static LocalDate getStartOfWeek(LocalDate date) {
        return date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    public static LocalDate getEndOfWeek(LocalDate date) {
        return date.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
    }

    public static LocalDate getStartOfMonth(LocalDate date) {
        return date.withDayOfMonth(1);
    }

    public static LocalDate getEndOfMonth(LocalDate date) {
        return date.with(TemporalAdjusters.lastDayOfMonth());
    }

    public static LocalDate getStartOfYear(LocalDate date) {
        return date.withDayOfYear(1);
    }

    public static LocalDate getEndOfYear(LocalDate date) {
        return date.with(TemporalAdjusters.lastDayOfYear());
    }
}
