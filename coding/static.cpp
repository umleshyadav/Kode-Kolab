#include<bits/stdc++.h>
using namespace std;

class Student {
public:
    static int count;
    Student() {
        count++;
    }
};
int Student::count = 0; // define outside

int main() {
    Student s1, s2;
    cout << Student::count<<"\n"; // Output: 2
    cout<<s1.count <<" "<<s2.count;
}
