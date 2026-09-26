package com.skillexchange.dto;

public class AdminStatsDto {
    private long totalStudents;
    private long totalSkills;
    private long totalExchanges;
    private long completedExchanges;
    private long pendingVerifications;
    private long pendingReports;

    public AdminStatsDto() {
    }

    public AdminStatsDto(long totalStudents, long totalSkills, long totalExchanges,
                         long completedExchanges, long pendingVerifications, long pendingReports) {
        this.totalStudents = totalStudents;
        this.totalSkills = totalSkills;
        this.totalExchanges = totalExchanges;
        this.completedExchanges = completedExchanges;
        this.pendingVerifications = pendingVerifications;
        this.pendingReports = pendingReports;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalSkills() {
        return totalSkills;
    }

    public void setTotalSkills(long totalSkills) {
        this.totalSkills = totalSkills;
    }

    public long getTotalExchanges() {
        return totalExchanges;
    }

    public void setTotalExchanges(long totalExchanges) {
        this.totalExchanges = totalExchanges;
    }

    public long getCompletedExchanges() {
        return completedExchanges;
    }

    public void setCompletedExchanges(long completedExchanges) {
        this.completedExchanges = completedExchanges;
    }

    public long getPendingVerifications() {
        return pendingVerifications;
    }

    public void setPendingVerifications(long pendingVerifications) {
        this.pendingVerifications = pendingVerifications;
    }

    public long getPendingReports() {
        return pendingReports;
    }

    public void setPendingReports(long pendingReports) {
        this.pendingReports = pendingReports;
    }
}
