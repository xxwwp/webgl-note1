const docPathPrefix = "./docs/";

class TOC {
  /** 渲染一个章节 */
  static renderGroup(group) {
    const item = $(`
      <li>
        <h2>${group.name}</h2>
      </li>
    `);
    const g = $("<ol></ol>");
    item.append(g);

    group.children.forEach((item) => {
      g.append(this.renderLi({ linkProps: item }));
    });

    return item;
  }

  /** 渲染一个标题 */
  static renderLi(props) {
    const li = $(`<li></li>`);
    li.append(this.renderLink(props.linkProps));
    props.linkProps.desc && li.append($(`<p>${props.linkProps.desc}</p>`));
    return li;
  }

  static renderLink(props) {
    return $(`<a href="${docPathPrefix}${props.rePath}/${props.rePath}.html">${props.name || props.rePath}</a>`);
  }
}

async function main() {
  const toc = $("#toc");
  const tocText = await fetch("./toc.yml").then((r) => r.text());
  const tocObj = YAML.parse(tocText);

  tocObj.toc.forEach((groupItem) => {
    toc.append(TOC.renderGroup(groupItem));
  });
}

main();
