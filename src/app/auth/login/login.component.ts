import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime, of } from 'rxjs';

// Sample custom validator
function mustContainQuestionMark(control: AbstractControl) {
  if (control.value.includes('?')) {
    return null;
  }

  return { doesNotContainQuestionMark: true };
}

// Sample custom async validator
function emailIsUnique(control: AbstractControl) {
  if (control.value !== 'test@example.com') {
    return of(null);
  }

  return of({ emailNotUnique: true });
}

@Component({
  selector: 'app-login',
  standalone: true,
  // imports: [FormsModule],
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  form = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
      asyncValidators: [emailIsUnique],
    }),
    password: new FormControl('', {
      validators: [
        Validators.minLength(6),
        Validators.required,
        mustContainQuestionMark,
      ],
    }),
  });

  ngOnInit(): void {
    // Prepopulate email input
    const savedForm = window.localStorage.getItem('saved-login-form');

    if (savedForm) {
      const loadedForm = JSON.parse(savedForm);
      this.form.patchValue({
        email: loadedForm.email,
      });
    }

    // Save email at local storage after typing
    const subscription = this.form.valueChanges
      .pipe(debounceTime(500))
      .subscribe({
        next: (val) => {
          window.localStorage.setItem(
            'saved-login-form',
            JSON.stringify({ email: val.email })
          );
        },
      });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe;
    });
  }

  get emailIsInvalid() {
    return (
      this.form.controls.email.touched &&
      this.form.controls.email.dirty &&
      this.form.controls.email.invalid
    );
  }

  get passwordIsInvalid() {
    return (
      this.form.controls.password.touched &&
      this.form.controls.password.dirty &&
      this.form.controls.password.invalid
    );
  }

  onSubmit() {
    const email = this.form.value.email;
    const password = this.form.value.password;
    console.log(email, password);
  }
  /* TEMPLATE-DRIVEN APPROACH
  private form = viewChild.required<NgForm>('form');
  private destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const savedForm = window.localStorage.getItem('saved-login-form');

      if (savedForm) {
        const loadedFormData = JSON.parse(savedForm);
        const savedEmail = loadedFormData.email;

        setTimeout(() => {
          this.form().setValue({ email: savedEmail, password: '' });
        }, 1);
      }

      const subscription = this.form()
        .valueChanges?.pipe(debounceTime(500))
        .subscribe({
          next: (val) =>
            window.localStorage.setItem(
              'saved-login-form',
              JSON.stringify({ email: val.email })
            ),
        });

      this.destroyRef.onDestroy(() => subscription?.unsubscribe());
    });
  }

  onSubmit(formData: NgForm) {
    if (formData.form.invalid) {
      return;
    }

    const email = formData.form.value.email;
    const password = formData.form.value.password;

    console.log(formData.form);
    console.log(email, password);

    formData.form.reset();
  }
  */
}
