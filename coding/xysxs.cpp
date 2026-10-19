struct Node {
    int data;
    Node *left, *right;
    Node(int v) : data(v), left(nullptr), right(nullptr) {}
};
vector<int> spiral(Node* root) {
    vector<int> res;
    if (!root) return res;
    queue<Node*> q;
    q.push(root);
    bool leftToRight = false;
    while (!q.empty()) {
        int sz = q.size();
        vector<int> level(sz);
        for (int i = 0; i < sz; i++) {
            Node* n = q.front(); q.pop();
            int pos = leftToRight ? i : (sz - 1 - i);
            level[pos] = n->data;
            if (n->left) q.push(n->left);
            if (n->right) q.push(n->right);
        }
        for (int x : level) res.push_back(x);
        leftToRight = !leftToRight;
    }
    return res;
}
int main() {
    Node* root = new Node(1);
    root->left = new Node(2);
    root->right = new Node(3);
    root->left->left = new Node(7);
    root->left->right = new Node(6);
    root->right->left = new Node(5);
    root->right->right = new Node(4);
    vector<int> ans = spiral(root);
    for (int x : ans) cout << x << " ";
    return 0;
}