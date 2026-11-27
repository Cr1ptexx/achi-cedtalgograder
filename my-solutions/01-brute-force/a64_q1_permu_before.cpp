/*
 * Permutation with Constraint  (a64_q1_permu_before, grader #1490)
 * Chapter    : brute-force
 *
 * Idea       :
 * Complexity :
 * Pitfalls   :
 */

#include <bits/stdc++.h>
using namespace std;
vector<vector<int>> ans;

void recur(set<int> &s , map<int , vector<int>> &lock , vector<int> &result , int n){
    if(result.size() == n){
        ans.push_back(result);
    }
    vector<int> cand(s.begin(), s.end());  
    for(auto sub : cand){
        result.push_back(sub);
        for(auto x : lock[sub]){
            s.insert(x);
        }
        s.erase(sub);
        recur(s , lock , result , n);
        result.pop_back();
        s.insert(sub);
        for(auto x : lock[sub]){
            s.erase(x);
        }
    }
}

int main() {
    int n , m; cin>>n>>m;
    map<int , vector<int>> lock;
    set<int> s;
    vector<int> result;
    for(int i = 0 ; i < n ; i++){
        s.insert(i);
    }
    for(int i = 0 ; i < m ; i++){
        int a , b; cin>>a>>b;
        lock[a].push_back(b);
        s.erase(b);
    }
    recur(s , lock , result , n);
    for(auto subans : ans){
        for(auto real : subans){
            cout<<real<<" ";
        }
        cout<<endl;
    }
}
