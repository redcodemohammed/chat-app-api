export default (name: string): boolean => {
    //check length:
    if (/^[a-zA-Z ]+$/.test(name)) return true;
    return false;
}
