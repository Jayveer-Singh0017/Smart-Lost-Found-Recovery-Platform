package com.smartlostfound.dto.admin;

public class AdminDashboardStatsDto {
    private long totalUsers;
    private long totalLostReports;
    private long totalFoundReports;
    private long totalOpenReports;
    private long totalResolvedReports;
    private long pendingClaimsCount;
    private long pendingModerationCount;

    public AdminDashboardStatsDto() {
    }

    public AdminDashboardStatsDto(long totalUsers, long totalLostReports, long totalFoundReports,
                                 long totalOpenReports, long totalResolvedReports,
                                 long pendingClaimsCount, long pendingModerationCount) {
        this.totalUsers = totalUsers;
        this.totalLostReports = totalLostReports;
        this.totalFoundReports = totalFoundReports;
        this.totalOpenReports = totalOpenReports;
        this.totalResolvedReports = totalResolvedReports;
        this.pendingClaimsCount = pendingClaimsCount;
        this.pendingModerationCount = pendingModerationCount;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalLostReports() {
        return totalLostReports;
    }

    public void setTotalLostReports(long totalLostReports) {
        this.totalLostReports = totalLostReports;
    }

    public long getTotalFoundReports() {
        return totalFoundReports;
    }

    public void setTotalFoundReports(long totalFoundReports) {
        this.totalFoundReports = totalFoundReports;
    }

    public long getTotalOpenReports() {
        return totalOpenReports;
    }

    public void setTotalOpenReports(long totalOpenReports) {
        this.totalOpenReports = totalOpenReports;
    }

    public long getTotalResolvedReports() {
        return totalResolvedReports;
    }

    public void setTotalResolvedReports(long totalResolvedReports) {
        this.totalResolvedReports = totalResolvedReports;
    }

    public long getPendingClaimsCount() {
        return pendingClaimsCount;
    }

    public void setPendingClaimsCount(long pendingClaimsCount) {
        this.pendingClaimsCount = pendingClaimsCount;
    }

    public long getPendingModerationCount() {
        return pendingModerationCount;
    }

    public void setPendingModerationCount(long pendingModerationCount) {
        this.pendingModerationCount = pendingModerationCount;
    }
}
