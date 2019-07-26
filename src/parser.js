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

  parseData(data, parent) {
    const [, , ...children] = data;
    this.addNode(data, parent);
    children.forEach(child => this.parseData(child, data.acid));

    return this;
  }

  addNode(data, parent) {
    const [name, , ...children] = data;
    const {
      acid,
      entities,
      prop: { source }
    } = data;

    this.nodes.push({
      name: JSON.stringify(name).replace(/"/g, ""),
      acid,
      parent: parent ? parent : null,
      children: children.map(({ acid }) => acid),
      entities: entities.length,
      source: parseJsDoc({ source })
    });

    return this;
  }

  getNode(nodeAcid) {
    const find = this.nodes.find(({ acid }) => acid === nodeAcid);

    return find ? find : null;
  }

  getChildren(nodeAcid) {
    const find = this.nodes.find(({ acid }) => acid === nodeAcid);

    return find ? find.children : null;
  }

  erase() {
    this.nodes.length = 0;

    return this;
  }

  get nodesCount() {
    return this.nodes.length;
  }
}

