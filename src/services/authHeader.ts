import { getCookie } from '../components/utilities/cookies/manageCookies';

export function authHeader() {
  if (getCookie()) {
    return "Bearer " + getCookie()
  } else {
    return "";
  }
}
