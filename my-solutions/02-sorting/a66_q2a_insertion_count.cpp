/*
 * Insertion Sort Count  (a66_q2a_insertion_count, grader #1586)
 * Chapter    : sorting
 *
 * Idea       :
 * Complexity :
 * Pitfalls   :
 */

#include <bits/stdc++.h>
using namespace std;

int main() {
    int n , m; cin>>n>>m;
    vector<int> v , zone;
    for(int i = 0 ; i < n ; i++){
        int val; cin>>val;
        v.push_back(val);
        zone.push_back(val);
    }
    sort(zone.begin() , zone.end());
    for(int i = 0 ; i < m ; i++){
        int q; cin>>q;
        int iReal = -1 , iFake = -1;
        for(int j = 0 ; j < n ; j++){
            if(zone[j] == q) iReal = j;
            if(v[j] == q) iFake = j;
            if(iReal != -1 && iFake != -1) break;
        }
        if(iReal >= iFake){
            int count = 0;
            for(int k = iFake ; k >= 0 ; k--){
                if(v[k] > v[iFake]) count++;
            }
            cout<<count<<'\n'; continue;
        }
        int len = iFake - iReal;
        for(int k = iFake+1 ; k < n ; k++){
            if(v[iFake] > v[k]) len++;
        }
        cout<<len<<endl;
    }
}
