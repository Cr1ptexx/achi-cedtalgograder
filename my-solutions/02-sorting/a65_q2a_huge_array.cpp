/*
 * Huge Array  (a65_q2a_huge_array, grader #1587)
 * Chapter    : sorting
 *
 * Idea       :
 * Complexity :
 * Pitfalls   :
 */

#include <bits/stdc++.h>
using namespace std;

int main() {
    std::ios_base::sync_with_stdio(false); 
    std::cin.tie(0);
    int n , m; cin>>n>>m;
    vector<pair<int,int>> v;
    int sum = 0;
    for(int i = 0 ; i < n ; i++){
        int a , b; cin>>a>>b;
        v.push_back({a,b});
    }
    sort(v.begin() , v.end());
    vector<pair<int , int>> ans;
    for(auto& [num , f] : v){
        ans.push_back({sum+=f , num});
    }
    for(int i = 0 ; i < m ; i++){
        int q; cin>>q;
        pair<int , int> p = {q , 0};
        int index = lower_bound(ans.begin() , ans.end() , p)-ans.begin();
        cout<<ans[index].second<<endl;
    }
}
