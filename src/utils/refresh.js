import toast from 'react-hot-toast';

export const refreshData = async (fetchFn, setRefreshing) => {
    setRefreshing(true);
    toast.loading("Refreshing data...", { id: "refresh" });
    try {
        await fetchFn();
        toast.success("Data refreshed successfully!", { id: "refresh" });
    } catch (error) {
        toast.error("Failed to refresh data", { id: "refresh" });
    } finally {
        setRefreshing(false);
    }
};