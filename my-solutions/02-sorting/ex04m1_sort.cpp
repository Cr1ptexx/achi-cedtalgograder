/*
 * 3 Values Sort  (ex04m1_sort, grader #1492)
 * Chapter    : sorting
 *
 * Idea       :
 * Complexity :
 * Pitfalls   :
 */

#include <bits/stdc++.h>
using namespace std;

int main() {
    int n; cin>>n;
    vector<int> v;
    vector<int> zone;
    int ans = 0;
    for(int i = 0 ; i < n ; i++){
        int val; cin>>val;
        zone.push_back(val); v.push_back(val);
    }
    sort(zone.begin() , zone.end());
    for(int i = 0 ; i < n ; i++){
        int need = zone[i];
        if(need == v[i]) continue;
        int j = -1;

        for(int k = i+1 ; k < n ; k++){
            if(v[k] == need && zone[k] == v[i]){
                j = k; break;
            }
        }
        if(j == -1){
            for(int k = i+1 ; k < n ; k++){
                if(v[k] == need && zone[k] != need){
                    j = k; break;
                }
            }
        }
        swap(v[i], v[j]);
        ans++;
    }
    cout<<ans;
} 