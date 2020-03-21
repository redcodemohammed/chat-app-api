import { sign } from "jsonwebtoken"
import settings from "../settings";
export default (username, name) => {
    return sign({
        username, name
    }, settings.secret);
}
