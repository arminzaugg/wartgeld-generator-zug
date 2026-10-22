import { useEffect, useState } from "react";

/** Below the `md` breakpoint (768px); `.98` leaves no gap at fractional widths. */
export const PHONE_QUERY = "(max-width: 767.98px)";

export const isPhoneViewport = () => window.matchMedia(PHONE_QUERY).matches;

/** Read synchronously so phones never render the desktop layout on the first frame. */
export const useIsPhone = () => {
  const [isPhone, setIsPhone] = useState(isPhoneViewport);

  useEffect(() => {
    const query = window.matchMedia(PHONE_QUERY);
    const update = () => setIsPhone(query.matches);
    query.addEventListener("change", update);
    update();
    return () => query.removeEventListener("change", update);
  }, []);

  return isPhone;
};
