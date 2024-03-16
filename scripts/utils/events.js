function setEventListenners(target, events, callbacks) {
    for (let index = 0; index < events.length; index++) {
        document.querySelector(String(target))
        .addEventListener(events[index], callbacks[index])
    }
}

export { setEventListenners };