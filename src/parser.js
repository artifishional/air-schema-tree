import doctrine from "doctrine";

function parseJsDoc({ source }) {
  let match = source.toString().match(/\/\*\*([\s\S]*?)\*\//g);
  let parsedData = {
    name: "no name",
    actions: [],
    requests: []
  };

  if (source.toString().indexOf("empty point ${key}") === -1 && match !== null) {
    const counters = { action: 0, request: 0 };
    match.forEach(text => {
      const ast = doctrine.parse(text, { unwrap: true });

      const obj = ast.tags.reduce((acc, { description, title, name }) => {
        if (name) {
          parsedData.name = name;
        }
        if (title === "action" || title === "request") {
          if (acc.type) {
            parsedData[`${acc.type}s`].push(acc);
            acc = {};
          }
          acc.id = counters[title]++;
          acc.title = description;
          acc.type = title;
        } else if (title === "description") {
          acc.description = description;
        } else if (title === "format") {
          acc.format = description;
        }

        return acc;
      }, {});

      if (obj.type) {
        parsedData[`${obj.type}s`].push(obj);
      }
    });

    return parsedData;
  }

  return { name: "no data", actions: [], requests: [] };
}

export default class Graph {
  constructor() {
    this.nodes = [];
  }

  parseData(data) {
    const [, , ...children] = data;
    this.addNode(data);
    children.forEach(child => this.parseData(child));

    return this;
  }

  addNode(data) {
    const [name, acid, ...children] = data;
    const {
      entities,
      prop: { source }
    } = data;

    this.nodes.push({
      name,
      acid,
      children: children.map(([name]) => name),
      entities: entities.length,
      source: parseJsDoc({ source })
    });

    return this;
  }

  getNode(nodeName) {
    const find = this.nodes.find(({ name }) => name === nodeName);

    return find ? find : null;
  }

  getChildren(nodeName) {
    const find = this.nodes.find(({ name }) => name === nodeName);

    return find ? find.children : null;
  }

  get nodesCount() {
    return this.nodes.length;
  }
}
