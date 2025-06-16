interface TranslationResources {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: TranslationResources = {
  en: {
    // Navigation
    'nav.account': 'Account',
    'nav.tickets': 'Tickets',
    'nav.boarding': 'Boarding',
    'nav.plan': 'Plan Journey',
    'nav.validation': 'Validation',
    'nav.alerts': 'Alerts',
    'nav.support': 'Support',
    'nav.settings': 'Settings',

    // Voice Commands
    'voice.listening': 'Listening for command',
    'voice.error': 'Sorry, I did not catch that. Please try again.',
    'voice.command.account': 'Go to Account',
    'voice.command.plan': 'Plan Journey',
    'voice.command.tickets': 'Tickets',
    'voice.command.boarding': 'Boarding',
    'voice.command.settings': 'Settings',

    // Account
    'account.title': 'Account & Subscription Management',
    'account.register': 'Register Account',
    'account.fullName': 'Full Name',
    'account.email': 'Email Address',
    'account.register.button': 'Register Account',
    'account.passes': 'Your Passes',
    'account.monthlyPass': 'Monthly Pass',
    'account.activate': 'Activate',
    'account.purchase': 'Purchase New Pass',

    // Tickets
    'tickets.title': 'Ticket Purchase & Validation',
    'tickets.purchase': 'Purchase Ticket',
    'tickets.single': 'Single Ride Ticket',
    'tickets.day': 'Day Pass',
    'tickets.validate': 'Validate',
    'tickets.notify': 'Notify Validator',
    'tickets.validated': 'Ticket validated successfully',

    // Boarding
    'boarding.title': 'Boarding Assistance',
    'boarding.detect': 'Start Detection',
    'boarding.detecting': 'Detecting vehicles... Please wait.',
    'boarding.assistance': 'Request Boarding Assistance',
    'boarding.assistance.requested': 'Driver notified to assist your boarding.',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.close': 'Close',
  },
  es: {
    // Navigation
    'nav.account': 'Cuenta',
    'nav.tickets': 'Boletos',
    'nav.boarding': 'Abordaje',
    'nav.plan': 'Planificar Viaje',
    'nav.validation': 'Validación',
    'nav.alerts': 'Alertas',
    'nav.support': 'Soporte',
    'nav.settings': 'Configuración',

    // Voice Commands
    'voice.listening': 'Escuchando comando',
    'voice.error': 'Lo siento, no entendí. Por favor inténtalo de nuevo.',
    'voice.command.account': 'Ir a Cuenta',
    'voice.command.plan': 'Planificar Viaje',
    'voice.command.tickets': 'Boletos',
    'voice.command.boarding': 'Abordaje',
    'voice.command.settings': 'Configuración',

    // Account
    'account.title': 'Gestión de Cuenta y Suscripciones',
    'account.register': 'Registrar Cuenta',
    'account.fullName': 'Nombre Completo',
    'account.email': 'Dirección de Correo',
    'account.register.button': 'Registrar Cuenta',
    'account.passes': 'Tus Pases',
    'account.monthlyPass': 'Pase Mensual',
    'account.activate': 'Activar',
    'account.purchase': 'Comprar Nuevo Pase',

    // Tickets
    'tickets.title': 'Compra y Validación de Boletos',
    'tickets.purchase': 'Comprar Boleto',
    'tickets.single': 'Boleto de Viaje Único',
    'tickets.day': 'Pase Diario',
    'tickets.validate': 'Validar',
    'tickets.notify': 'Notificar Validador',
    'tickets.validated': 'Boleto validado exitosamente',

    // Boarding
    'boarding.title': 'Asistencia de Abordaje',
    'boarding.detect': 'Iniciar Detección',
    'boarding.detecting': 'Detectando vehículos... Por favor espere.',
    'boarding.assistance': 'Solicitar Asistencia de Abordaje',
    'boarding.assistance.requested': 'Conductor notificado para asistir tu abordaje.',

    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Ocurrió un error',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.submit': 'Enviar',
    'common.close': 'Cerrar',
  },
  fr: {
    // Navigation
    'nav.account': 'Compte',
    'nav.tickets': 'Billets',
    'nav.boarding': 'Embarquement',
    'nav.plan': 'Planifier Voyage',
    'nav.validation': 'Validation',
    'nav.alerts': 'Alertes',
    'nav.support': 'Support',
    'nav.settings': 'Paramètres',

    // Voice Commands
    'voice.listening': 'Écoute de commande',
    'voice.error': 'Désolé, je n\'ai pas compris. Veuillez réessayer.',
    'voice.command.account': 'Aller au Compte',
    'voice.command.plan': 'Planifier Voyage',
    'voice.command.tickets': 'Billets',
    'voice.command.boarding': 'Embarquement',
    'voice.command.settings': 'Paramètres',

    // Account
    'account.title': 'Gestion de Compte et Abonnements',
    'account.register': 'Créer un Compte',
    'account.fullName': 'Nom Complet',
    'account.email': 'Adresse Email',
    'account.register.button': 'Créer un Compte',
    'account.passes': 'Vos Passes',
    'account.monthlyPass': 'Pass Mensuel',
    'account.activate': 'Activer',
    'account.purchase': 'Acheter Nouveau Pass',

    // Tickets
    'tickets.title': 'Achat et Validation de Billets',
    'tickets.purchase': 'Acheter Billet',
    'tickets.single': 'Billet Simple',
    'tickets.day': 'Pass Journée',
    'tickets.validate': 'Valider',
    'tickets.notify': 'Notifier Contrôleur',
    'tickets.validated': 'Billet validé avec succès',

    // Boarding
    'boarding.title': 'Assistance Embarquement',
    'boarding.detect': 'Démarrer Détection',
    'boarding.detecting': 'Détection véhicules... Veuillez patienter.',
    'boarding.assistance': 'Demander Assistance Embarquement',
    'boarding.assistance.requested': 'Conducteur notifié pour vous aider à embarquer.',

    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur s\'est produite',
    'common.save': 'Sauvegarder',
    'common.cancel': 'Annuler',
    'common.submit': 'Soumettre',
    'common.close': 'Fermer',
  }
};

export function useTranslation(language: string = 'en') {
  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return { t };
}
