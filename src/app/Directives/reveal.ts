import { Directive, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Directive({
  selector: '[appReveal]'
})
export class Reveal implements AfterViewInit {

  constructor(private el: ElementRef) { }

  @Input() delay: number = 0;

  ngAfterViewInit(): void {
    this.el.nativeElement.style.transitionDelay = `${this.delay}s`;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active")
      }


    },
      { threshold: 0.2 })
    observer.observe(this.el.nativeElement)
  }

}
