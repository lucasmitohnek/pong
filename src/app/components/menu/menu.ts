import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu implements OnInit, OnDestroy {
  selectionsound = new Audio('/selection.mp3');
  leave: boolean = false;
  pageload: boolean = true;

  ngOnInit(): void {
    setTimeout(() => this.enter(), 1000);
  }

  ngOnDestroy(): void {
    this.leave = false;
    this.pageload = true;
  }

  selection1() {
    this.leave = !this.leave;
    setTimeout(function () {
      window.open('standard', '_self');
    }, 1000);
    this.selectionsound.play();
  }
  selection2() {
    this.leave = !this.leave;
    setTimeout(function () {
      window.open('standard', '_self');
    }, 1000);
    this.selectionsound.play();
  }
  selection3() {
    this.leave = !this.leave;
    setTimeout(function () {
      window.open('squash', '_self');
    }, 1000);
    this.selectionsound.play();
  }

  enter() {
    this.pageload = !this.pageload;
  }
}
