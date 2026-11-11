import  type{ NavigateFunction } from "react-router-dom";

let navigate: NavigateFunction | null = null;


/**
 * Sets the navigate function to be used by the navigateTo function.
 * This function should be passed the navigate function from the useNavigate hook
 * provided by react-router-dom.
 * @param {NavigateFunction} nav - The navigate function to be set.
 * @returns {void}
 */
export const setNavigate = (nav: NavigateFunction): void => {
    /**
     * The navigate function to be used by the navigateTo function.
     * This is set to null by default, and should be set to the navigate
     * function provided by react-router-dom.
     */
    navigate = nav;
};

/**
 * This function navigates to a given path using the navigate function
 * passed to setNavigate. If no navigate function has been set, this
 * function does nothing.
 * @param {string} path - The path to navigate to.
 * @returns {void}
 */
export const navigateTo=(path: string): void => {
    if (navigate) {
        navigate(path);
    }
};
