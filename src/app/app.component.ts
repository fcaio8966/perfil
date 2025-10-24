import { Component, OnInit } from '@angular/core';
import { 
  FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors 
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class AppComponent implements OnInit {
  title = 'Perfil';
  profileForm: FormGroup;
  profileImage: string | null = null;

  validatePhone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return { required: true };
      
      // Remove tudo que não é dígito
      const digits = value.replace(/\D/g, '');
      
      // Verifica se tem o código do país (55) e pelo menos 10 dígitos após (DDD + número)
      if (digits.length < 12) {
        return { minlength: true };
      }
      
      // Verifica se o formato está correto (+55 XX XXXXX-XXXX)
      const formatRegex = /^\+55\s\d{2}\s\d{4,5}-\d{4}$/;
      if (!formatRegex.test(value)) {
        return { format: true };
      }
      
      return null;
    };
  }

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      fullName: ['Ana Sha', [Validators.required]],
      username: ['anasha', [Validators.required]],
      bio: ['Apaixonada por tecnologia e sempre em busca dos melhores produtos.'],
      email: ['ana@gmail.com', [Validators.required, Validators.email]],
      phone: ['+55 11 99999-9999', [Validators.required, this.validatePhone()]]
    });
  }

  ngOnInit() {
    // Inicialização adicional se necessário
  }

  // Getters para acessar os campos do formulário
  get fullName() {
    return this.profileForm.get('fullName')?.value || '';
  }

  get username() {
    return this.profileForm.get('username')?.value || '';
  }

  get phoneControl() {
    return this.profileForm.get('phone');
  }

  get phoneErrors(): string {
    const control = this.phoneControl;
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'O telefone é obrigatório';
      }
      if (control.errors['minlength']) {
        return 'O número deve ter pelo menos 10 dígitos (DDD + número)';
      }
      if (control.errors['format']) {
        return 'Formato inválido. Use: +55 XX XXXXX-XXXX';
      }
    }
    return '';
  }

  onPhotoChange() {
    console.log('Mudando foto do perfil');
  }

  onSubmit() {
    if (this.profileForm.valid) {
      console.log('Formulário enviado:', this.profileForm.value);
    }
  }

  /**
   * Handler para mascarar o telefone enquanto o usuário digita.
   * Formato visual: +55 XX XXXXX-XXXX (aceita também números locais e adapta)
   */
  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, ''); // apenas dígitos

    // Se o usuário digitou sem código do país, assumimos +55
    if (!digits.startsWith('55')) {
      digits = '55' + digits;
    }

    // remova o '55' para formatar o restante
    const rest = digits.slice(2);

    let formatted = '+55 ';
    if (rest.length <= 2) {
      formatted += rest;
    } else if (rest.length <= 6) {
      formatted += rest.slice(0, 2) + ' ' + rest.slice(2);
    } else if (rest.length <= 10) {
      // 4+4 ou 5+4
      if (rest.length === 9) {
        // forma comum 9 dígitos do número: 5 + 4
        formatted += rest.slice(0, 2) + ' ' + rest.slice(2, 7) + '-' + rest.slice(7);
      } else {
        formatted += rest.slice(0, 2) + ' ' + rest.slice(2, 6) + '-' + rest.slice(6);
      }
    } else {
      // truncar excesso
      formatted += rest.slice(0, 2) + ' ' + rest.slice(2, 7) + '-' + rest.slice(7, 11);
    }

    // Atualiza o input exibido e o FormControl sem disparar ciclo infinito
    input.value = formatted;
    this.profileForm.get('phone')?.setValue(formatted, { emitEvent: false });
  }
}
