export default (username: string): boolean => {
    //check length:
    if (/^[a-zA-Z0-9]+$/.test(username)) return true;
    return false;
}
