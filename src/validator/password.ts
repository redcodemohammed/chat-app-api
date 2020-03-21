export default (password: string): boolean => {
    //check length:
    if (/^(?=.*\d).{8,16}$/.test(password)) return true;
    return false;
}
