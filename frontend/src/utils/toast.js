import toast from "react-hot-toast";

let activeToast = null;

// ✅ LOADING (only one at a time)
export const showLoading = (msg = "Loading...") => {
  if (activeToast) {
    toast.dismiss(activeToast);
  }

  activeToast = toast.loading(msg);
  return activeToast;
};

// ✅ SUCCESS
export const showSuccess = (msg) => {
  if (activeToast) toast.dismiss(activeToast);
  activeToast = toast.success(msg);
};

// ✅ ERROR
export const showError = (msg) => {
  if (activeToast) toast.dismiss(activeToast);
  activeToast = toast.error(msg);
};

// ✅ UPDATE (SAFE)
export const updateToast = (id, msg, type = "success") => {
  toast.dismiss(id);

  activeToast =
    type === "error"
      ? toast.error(msg)
      : toast.success(msg);
};