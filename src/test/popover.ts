const openPopovers = new WeakSet<HTMLElement>();

const show = (element: HTMLElement) => {
  element.style.display = "block";
  openPopovers.add(element);
};

const hide = (element: HTMLElement) => {
  element.style.removeProperty("display");
  openPopovers.delete(element);
};

export const installPopoverPolyfill = () => {
  if ("showPopover" in HTMLElement.prototype) return;

  Object.defineProperties(HTMLElement.prototype, {
    showPopover: {
      configurable: true,
      value(this: HTMLElement) {
        show(this);
      },
    },
    hidePopover: {
      configurable: true,
      value(this: HTMLElement) {
        hide(this);
      },
    },
    togglePopover: {
      configurable: true,
      value(this: HTMLElement) {
        if (openPopovers.has(this)) hide(this);
        else show(this);
        return openPopovers.has(this);
      },
    },
  });

  document.addEventListener("click", (event) => {
    const invoker = event.target instanceof Element ? event.target.closest("[popovertarget]") : null;
    const id = invoker?.getAttribute("popovertarget");
    const popover = id ? document.getElementById(id) : null;
    if (popover) popover.togglePopover();
  });
};
