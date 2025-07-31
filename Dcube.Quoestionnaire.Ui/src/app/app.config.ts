import { ApplicationConfig, APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations'; 
import { routes } from './app.routes';
import { ApiConstantsService } from './shared/Api/api-constants.service';

const initializeApiConfig = (apiConfigService: ApiConstantsService) => () => apiConfigService.loadConfig();

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApiConfig,
      deps: [ApiConstantsService],
      multi: true
    }
  ]
};
