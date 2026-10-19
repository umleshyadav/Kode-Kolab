#include <bits/stdc++.h>

using namespace std;

int main(){
    int p;
    int q;
   
    cin>>p>>q;
    
    while(q!=0){
       int c = (p&q);
       p=p^q;
       q=c<<1;
    }
  cout<<p;
    return 0;
}