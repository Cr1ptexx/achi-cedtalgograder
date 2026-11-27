/*
 * Tower Defense  (a65_q1_tower_defense, grader #1487)
 * Chapter    : brute-force
 *
 * Idea       :
 * Complexity :
 * Pitfalls   :
 */

#include <bits/stdc++.h>
using namespace std;

void recur(int pos , vector<int> &h , vector<int> &p , int w){
    
    for(int i = 0 ; i < h.size() ; i++){
        if(h[i]==0) continue;
        if(pos-w <= p[i] && pos+w >= p[i]){
            h[i]--;
            return;
        }
    }
}

int main() {
    vector<int> p , h , t;
    int n , m , k , w; cin>>n>>m>>k>>w;
    for(int i = 0 ; i < m ; i++){
        int val; cin>>val;
        p.push_back(val);
    }
    for(int j = 0 ; j < m ; j++){
        int val; cin>>val;
        h.push_back(val);
    }
    for(int l = 0 ; l < k ; l++){
        int pos; cin>>pos;
        recur(pos , h , p , w);
    }
    int sum = 0;
    for(int x : h){
        sum += x;
    }
    cout<<sum;   
}
