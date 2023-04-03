import moment from "moment";

export function getToken(): string {
  return window.localStorage.getItem("meedu-user-token") || "";
}

export function setToken(token: string) {
  window.localStorage.setItem("meedu-user-token", token);
}

export function clearToken() {
  window.localStorage.removeItem("meedu-user-token");
}

export function getPlayId(): string {
  return window.localStorage.getItem("meedu-play-id") || "";
}

export function savePlayId(id: string) {
  window.localStorage.setItem("meedu-play-id", id);
}

export function clearPlayId() {
  window.localStorage.removeItem("meedu-play-id");
}

export function getMsv(): string {
  return window.localStorage.getItem("meedu-msv") || "";
}

export function saveMsv(msv: string) {
  window.localStorage.setItem("meedu-msv", msv);
}

export function clearMsv() {
  window.localStorage.removeItem("meedu-msv");
}

export function saveLoginCode(code: string) {
  window.localStorage.setItem("login_code", code);
}

export function getLoginCode() {
  return window.localStorage.getItem("login_code");
}

export function clearLoginCode() {
  window.localStorage.removeItem("login_code");
}

export function saveSessionLoginCode(code: string) {
  window.sessionStorage.setItem("login_code:" + code, code);
}

export function getSessionLoginCode(code: string) {
  return window.sessionStorage.getItem("login_code:" + code);
}

export function getCommentTime(dateStr: string) {
  const interval = moment().diff(moment(dateStr), "seconds");
  if (interval < 60) {
    return "刚刚";
  } else if (interval < 60 * 60) {
    let tempTime = Math.floor(interval / 60);
    return `${tempTime}分钟前`;
  } else if (interval < 60 * 60 * 24) {
    let tempTime = Math.floor(interval / (60 * 60));
    return `${tempTime}小时前`;
  } else if (interval < 60 * 60 * 24 * 7) {
    let tempTime = Math.floor(interval / (60 * 60 * 24));
    return `${tempTime}天前`;
  } else if (interval < 60 * 60 * 24 * 365) {
    return moment(interval).format("MM-DD");
  } else {
    return moment(interval).format("YYYY-MM-DD");
  }
}

export function dateFormat(dateStr: string) {
  return moment(dateStr).format("YYYY-MM-DD HH:mm");
}

export function generateUUID(): string {
  let guid = "";
  for (let i = 1; i <= 32; i++) {
    let n = Math.floor(Math.random() * 16.0).toString(16);
    guid += n;
    if (i === 8 || i === 12 || i === 16 || i === 20) guid += "-";
  }
  return guid;
}

export function transformBase64ToBlob(
  base64: string,
  mime: string,
  filename: string
): File {
  const arr = base64.split(",");
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export function getHost() {
  return window.location.protocol + "//" + window.location.host + "/";
}

export function inStrArray(array: string[], value: string): boolean {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === value) {
      return true;
    }
  }
  return false;
}

export function getAppUrl() {
  let host = window.location.protocol + "//" + window.location.host;
  let pathname = window.location.pathname;
  if (pathname && pathname !== "/") {
    host += pathname;
  }
  return host + "/#";
}
