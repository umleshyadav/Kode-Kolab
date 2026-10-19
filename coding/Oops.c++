// ✅ Object-Oriented Programming in C++ - Complete Guide for TCS Prime

#include <iostream>
#include <string>
using namespace std;

//-------------------------------------------
// 🔹 Class and Object
//-------------------------------------------
class Car {
public:
    string brand;
    int speed;

    void drive() {
        cout << brand << " is driving at " << speed << " km/h." << endl;
    }
};

//-------------------------------------------
// 🔹 Encapsulation and Access Specifiers
//-------------------------------------------
class BankAccount {
private:
    int balance;  // hidden from outside

public:
    void deposit(int amount) {
        if (amount > 0) balance += amount;
    }
    int getBalance() {
        return balance;
    }
};

//-------------------------------------------
// 🔹 Abstraction (hiding implementation)
//-------------------------------------------
class Remote {
public:
    void pressPowerButton() {
        cout << "Power button pressed. TV turned ON/OFF." << endl;
    }
};

//-------------------------------------------
// 🔹 Inheritance
//-------------------------------------------
// Single Inheritance
class Animal {
public:
    void eat() { cout << "Eating..." << endl; }
};
class Dog : public Animal {
public:
    void bark() { cout << "Barking..." << endl; }
};

// Multilevel Inheritance
class Vehicle {
public:
    void move() { cout << "Moving..." << endl; }
};
class Car2 : public Vehicle {
public:
    void honk() { cout << "Honking..." << endl; }
};
class ElectricCar : public Car2 {
public:
    void charge() { cout << "Charging..." << endl; }
};

// Multiple Inheritance
class Engine {
public:
    void start() { cout << "Engine started" << endl; }
};
class Battery {
public:
    void power() { cout << "Battery powering system" << endl; }
};
class HybridCar : public Engine, public Battery {
public:
    void drive() { cout << "Hybrid car is driving" << endl; }
};

//-------------------------------------------
// 🔹 Diamond Problem & Virtual Inheritance
//-------------------------------------------
class A {
public:
    void greet() { cout << "Hello from A" << endl; }
};
class B : virtual public A {};
class C : virtual public A {};
class D : public B, public C {};

//-------------------------------------------
// 🔹 Polymorphism
//-------------------------------------------
// Compile-time Polymorphism: Function Overloading
class Calculator {
public:
    int add(int a, int b) { return a + b; }
    double add(double a, double b) { return a + b; }
};

// Runtime Polymorphism: Virtual Functions
class Shape {
public:
    virtual void draw() { cout << "Drawing shape" << endl; }
};
class Circle : public Shape {
public:
    void draw() override { cout << "Drawing circle" << endl; }
};

//-------------------------------------------
// 🔹 Constructor and Destructor
//-------------------------------------------
class Person {
    string name;
    int age;
public:
    // Default constructor
    Person() {
        name = "Unknown"; age = 0;
    }

    // Parameterized constructor
    Person(string n, int a) {
        name = n; age = a;
    }

    // Copy constructor
    Person(const Person& p) {
        name = p.name;
        age = p.age;
    }

    // Destructor
    ~Person() {
        cout << "Destructor called for " << name << endl;
    }

    void display() {
        cout << name << " is " << age << " years old." << endl;
    }
};

//-------------------------------------------
// 🔹 this pointer
//-------------------------------------------
class Counter {
    int count;
public:
    Counter(int count) {
        this->count = count;
    }
    void show() {
        cout << "Count = " << this->count << endl;
    }
};

//-------------------------------------------
// 🔹 Static Data and Static Functions
//-------------------------------------------
class Student {
    static int count;
public:
    Student() { count++; }
    static int getCount() {
        return count;
    }
};
int Student::count = 0;

//-------------------------------------------
// 🔹 Abstract Class
//-------------------------------------------
class AbstractShape {
public:
    virtual void area() = 0;  // pure virtual function
};
class Square : public AbstractShape {
public:
    void area() override {
        cout << "Area of square = side * side" << endl;
    }
};

//-------------------------------------------
// MAIN FUNCTION TO DEMONSTRATE ALL
//-------------------------------------------
int main() {
    // Class & Object
    Car c1;
    c1.brand = "Toyota";
    c1.speed = 80;
    c1.drive();

    // Encapsulation
    BankAccount acc;
    acc.deposit(1000);
    cout << "Balance: Rs." << acc.getBalance() << endl;

    // Abstraction
    Remote r;
    r.pressPowerButton();

    // Inheritance
    Dog d;
    d.eat(); d.bark();

    ElectricCar ecar;
    ecar.move(); ecar.honk(); ecar.charge();

    HybridCar hcar;
    hcar.start(); hcar.power(); hcar.drive();

    D obj;
    obj.greet(); // Diamond Problem resolved

    // Polymorphism
    Calculator calc;
    cout << "Sum: " << calc.add(5, 3) << endl;
    cout << "Sum: " << calc.add(2.5, 4.1) << endl;

    Shape* s = new Circle();
    s->draw();
    delete s;

    // Constructor and Destructor
    Person p1("John", 25);
    Person p2 = p1; // Copy constructor
    p1.display();
    p2.display();

    // this pointer
    Counter counter(10);
    counter.show();

    // Static function
    Student s1, s2, s3;
    cout << "Total students: " << Student::getCount() << endl;

    // Abstract class
    Square sq;
    sq.area();

    return 0;
}
