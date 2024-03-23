function generateKey(size = 3) {
    let key = '';

    const alphaNum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const len = alphaNum.length - 1;

    // Math.random() * (10**18 - 10**15) + 10**15
    while(size > 0) {
        const pos = Math.floor(Math.random() * len);
        key += alphaNum[pos];
        size--;
    }

    return key;
}

export { generateKey };