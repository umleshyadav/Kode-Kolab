#include <bits/stdc++.h>

using namespace std;

int main(){
    int p;
    int q;
    int r;
    cin>>p>>q>>r;
    int cnt=0;
    bool f = false;
    while(p<r && q < r){
        p=p+1;
        q=q+1;
        r=r-1;
        cnt++;
    }
    if(p==q && q==r){
            cout<<cnt;
        }else cout<<-1;

    return 0;
}