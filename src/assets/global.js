(async () => {
  // 渲染 pre[data-code] 代码元素
  // pre[data-slice] 用于设置代码切片
  // pre[data-lang] 用于设置代码样式
  async function renderCode() {
    /** @type {HTMLPreElement[]} */
    const els = Array.from(document.querySelectorAll("[data-code]"));
    return Promise.allSettled(
      els.map(async (item) => {
        const path = item.getAttribute("data-code");
        if (typeof path !== "string") return;

        let code = await fetch(path).then((r) => r.text());

        const slice = item.getAttribute("data-slice");
        if (typeof slice === "string") {
          const arr = slice.split(",").map((v) => parseInt(v));
          if (!Number.isNaN(arr[0]) && !Number.isNaN(arr[1])) {
            code = code.split("\n").slice(arr[0], arr[1]).join("\n");
          }
        }

        const codeEl = document.createElement("code");
        const text = document.createTextNode(code);
        codeEl.appendChild(text);

        const lang = item.getAttribute("data-lang");
        if (typeof lang === "string" && lang !== "") {
          codeEl.classList.add("language-" + lang);
          // 代码加载 <code> 元素
          item.appendChild(codeEl);
        } else {
          // 非代码加载文本结点
          item.appendChild(text);
        }
      })
    );
  }

  class Load {
    static css(href) {
      const el = document.createElement("link");
      el.rel = "stylesheet";
      el.href = href;
      document.head.appendChild(el);
      return el;
    }
    static script(src, props = {}) {
      const el = document.createElement("script");
      el.src = src;
      document.head.appendChild(el);

      for (const key in props) {
        if (Object.hasOwnProperty.call(props, key)) {
          const value = props[key];
          el.setAttribute(key, value);
        }
      }

      return el;
    }
    static loaded(el) {
      return new Promise((r) => (el.onload = r));
    }
  }

  // 加载 Prism.js
  function loadPrism() {
    Load.css("https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.css");

    return Promise.allSettled([
      Load.loaded(Load.script("https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js")),
      Load.loaded(
        Load.script("https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js")
      ),
    ]);
  }

  // 加载 MathJax
  function loadMathJax() {
    MathJax = {
      tex: {
        inlineMath: [
          ["$", "$"],
          ["\\(", "\\)"],
        ],
      },
    };
    return Promise.allSettled([
      Load.loaded(
        Load.script("https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js", {
          async: true,
          id: "MathJax-script",
        })
      ),
    ]);
  }

  // 渲染目录
  function renderTOC() {
    /** @type {HTMLHeadingElement[]} */
    const titles = Array.from(document.getElementsByTagName("h2"));
    const ul = document.createElement("ul");

    titles.forEach((element) => {
      const li = document.createElement("li");
      li.innerText = element.innerText;

      li.style.cursor = "pointer";
      li.style.textDecoration = "underline";
      ul.appendChild(li);
      li.onclick = () => element.scrollIntoView();
    });

    const h1 = document.getElementsByTagName("h1")[0];
    h1.parentElement.insertBefore(ul, h1.nextSibling);
  }

  renderTOC();

  await renderCode();
  await loadPrism();
  window.Prism.highlightAll();
  loadMathJax();
})();
