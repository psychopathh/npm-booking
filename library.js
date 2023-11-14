const url = "http://localhost:3000";

var boostrap = async () => {
  const page = await fetch(url);
  const html = await page.text();
  let parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const scripts = doc.getElementsByTagName("script");
  const links = Array.from(doc.getElementsByTagName("link"));
  const css = links.filter((el) => el.rel === "stylesheet");
  const createScript = document.createElement("script");
  createScript.setAttribute("src", url + scripts[0].src.replace("file://", ""));
  createScript.setAttribute("defer", "defer");
  const createCss = document.createElement("link");
  createCss.setAttribute("href", url + css[0].href.replace("file://", ""));
  createCss.setAttribute("rel", "stylesheet");
  window.document.body.appendChild(createScript);
  window.document.head.appendChild(createCss);
};

boostrap();
