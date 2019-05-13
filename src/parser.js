export default class Graph {
    constructor() {
        this.nodes = [];
    }

    parseData([name, acid, ...children]) {
        this.addNode([name, acid, ...children]);
        children.forEach(child => this.parseData(child));

        return this;
    }

    addNode([name, acid, ...children]) {
        this.nodes.push({
            name,
            acid,
            children: children.map(([name]) => name)
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