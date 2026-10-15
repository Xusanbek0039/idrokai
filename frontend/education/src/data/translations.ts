export type Language = 'uz' | 'ru';

export const translations = {
  uz: {
    // App Header & Branding
    brandTitle: "IDROK AI Education",
    brandSubtitle: "Zamonaviy O'quv Markaz Boshqaruv Tizimi",
    centerName: "Registon O'quv Markazi",
    themeLight: "Yorug' rejim",
    themeDark: "Tungi rejim",
    langUz: "O'zbekcha",
    langRu: "Русский",
    activeRole: "Joriy rol:",
    switchRole: "Rolni almashtirish",

    // Roles
    roles: {
      edu_owner: "Boshliq / Ta'sischi (Owner)",
      edu_assistant_admin: "Yordamchi Admin",
      edu_operations_manager: "Ish boshqaruvchi (Manager)",
      teacher: "O'qituvchi",
      student: "O'quvchi / Talaba",
    },

    // Navigation
    nav: {
      dashboard: "Boshqaruv paneli",
      students: "O'quvchilar",
      teachers: "O'qituvchilar",
      groups: "Guruhlar",
      timetable: "Dars jadvali",
      attendance: "Davomat",
      tuition: "To'lovlar & Shartnomalar",
      homework: "Uyga vazifalar",
      exams: "Testlar & Imtihonlar",
      gamification: "XP & Sovrinlar",
      reports: "Hisobotlar",
      myLessons: "Mening darslarim",
      myHomework: "Uyga vazifalarim",
      myAttendance: "Mening davomatim",
      myTuition: "O'qish to'lovlarim",
      myRating: "Mening reytingim",
    },

    // Common Actions
    actions: {
      addStudent: "Yangi o'quvchi",
      recordPayment: "To'lov qabul qilish",
      takeAttendance: "Davomat olish",
      assignHomework: "Vazifa yuklash",
      submitHomework: "Vazifani topshirish",
      createGroup: "Yangi guruh",
      viewAll: "Barchasini ko'rish",
      search: "Qidirish...",
      filter: "Filtr",
      export: "Eksport (Excel)",
      save: "Saqlash",
      cancel: "Bekor qilish",
      close: "Yopish",
      details: "Batafsil",
      status: "Holati",
      action: "Amal",
    },

    // Common Statuses
    status: {
      active: "Faol",
      paid: "To'langan",
      unpaid: "Qarzdor",
      partiallyPaid: "Qisman to'langan",
      present: "Bor",
      absent: "Yo'q",
      late: "Kechikdi",
      graded: "Baholandi",
      pending: "Kutilmoqda",
      submitted: "Topshirildi",
    },

    // Stats
    stats: {
      totalStudents: "Jami o'quvchilar",
      activeGroups: "Faol guruhlar",
      monthlyRevenue: "Oylik tushum",
      overdueDebt: "Qarzdorlik summasi",
      attendanceRate: "O'rtacha davomat",
      teachersCount: "O'qituvchilar",
      averageGrade: "O'rtacha o'zlashtirish",
      todayLessons: "Bugungi darslar",
      myRank: "Guruhdagi o'rnim",
      myCoins: "Mening tangalarim",
      myXp: "Mening XP balim",
      tuitionDue: "To'lanishi kerak",
    },

    // Placeholders & Modals
    modals: {
      addStudentTitle: "Yangi o'quvchini ro'yxatdan o'tkazish",
      recordPaymentTitle: "To'lov qabul qilish kvitansiyasi",
      takeAttendanceTitle: "Bugungi dars davomatini belgilash",
      studentName: "O'quvchi F.I.Sh",
      phone: "Telefon raqami",
      group: "Guruh",
      course: "Kurs yo'nalishi",
      amount: "To'lov summasi",
      paymentMethod: "To'lov turi",
      cash: "Naqd pul",
      card: "Plastik karta (UzCard/Humo)",
      transfer: "Bank o'tkazmasi",
      notes: "Izoh",
    },

    // Sections
    sections: {
      quickActions: "Tezkor amallar",
      recentPayments: "Oxirgi to'lovlar",
      debtorsList: "Qarzdor o'quvchilar",
      leaderboard: "O'quvchilar reytingi (LMS Gamification)",
      upcomingExams: "Yaqinlashib kelayotgan imtihonlar",
      teacherSchedule: "O'qituvchi dars grafigi",
      weeklySchedule: "Haftalik dars jadvali",
      groupAttendance: "Guruh davomati jurnali",
    }
  },

  ru: {
    // App Header & Branding
    brandTitle: "IDROK AI Education",
    brandSubtitle: "Современная CRM-система для учебных центров",
    centerName: "Учебный Центр Регистон",
    themeLight: "Светлая тема",
    themeDark: "Темная тема",
    langUz: "O'zbekcha",
    langRu: "Русский",
    activeRole: "Текущая роль:",
    switchRole: "Сменить роль",

    // Roles
    roles: {
      edu_owner: "Руководитель / Учредитель (Owner)",
      edu_assistant_admin: "Помощник администратора",
      edu_operations_manager: "Операционный менеджер",
      teacher: "Преподаватель",
      student: "Ученик / Студент",
    },

    // Navigation
    nav: {
      dashboard: "Панель управления",
      students: "Ученики",
      teachers: "Преподаватели",
      groups: "Группы",
      timetable: "Расписание уроков",
      attendance: "Посещаемость",
      tuition: "Оплаты и договоры",
      homework: "Домашние задания",
      exams: "Тесты и экзамены",
      gamification: "XP и награды",
      reports: "Отчеты",
      myLessons: "Мои уроки",
      myHomework: "Мои задания",
      myAttendance: "Моя посещаемость",
      myTuition: "Оплата за обучение",
      myRating: "Мой рейтинг",
    },

    // Common Actions
    actions: {
      addStudent: "Новый ученик",
      recordPayment: "Принять оплату",
      takeAttendance: "Отметить посещаемость",
      assignHomework: "Задать задание",
      submitHomework: "Сдать задание",
      createGroup: "Создать группу",
      viewAll: "Смотреть все",
      search: "Поиск...",
      filter: "Фильтр",
      export: "Экспорт (Excel)",
      save: "Сохранить",
      cancel: "Отмена",
      close: "Закрыть",
      details: "Подробнее",
      status: "Статус",
      action: "Действие",
    },

    // Common Statuses
    status: {
      active: "Активен",
      paid: "Оплачено",
      unpaid: "Долг",
      partiallyPaid: "Частично",
      present: "Был",
      absent: "Не был",
      late: "Опоздал",
      graded: "Оценено",
      pending: "В ожидании",
      submitted: "Сдано",
    },

    // Stats
    stats: {
      totalStudents: "Всего учеников",
      activeGroups: "Активные группы",
      monthlyRevenue: "Выручка за месяц",
      overdueDebt: "Сумма задолженности",
      attendanceRate: "Средняя посещаемость",
      teachersCount: "Преподаватели",
      averageGrade: "Средняя успеваемость",
      todayLessons: "Уроков сегодня",
      myRank: "Мое место в группе",
      myCoins: "Мои монеты",
      myXp: "Мой опыт (XP)",
      tuitionDue: "К оплате",
    },

    // Placeholders & Modals
    modals: {
      addStudentTitle: "Регистрация нового ученика",
      recordPaymentTitle: "Квитанция приема оплаты",
      takeAttendanceTitle: "Отметить посещаемость на сегодня",
      studentName: "Ф.И.О. ученика",
      phone: "Номер телефона",
      group: "Группа",
      course: "Направление курса",
      amount: "Сумма оплаты",
      paymentMethod: "Способ оплаты",
      cash: "Наличные",
      card: "Банковская карта (UzCard/Humo)",
      transfer: "Банковский перевод",
      notes: "Примечание",
    },

    // Sections
    sections: {
      quickActions: "Быстрые действия",
      recentPayments: "Последние платежи",
      debtorsList: "Список должников",
      leaderboard: "Рейтинг учеников (LMS Геймификация)",
      upcomingExams: "Ближайшие экзамены",
      teacherSchedule: "График уроков учителя",
      weeklySchedule: "Недельное расписание",
      groupAttendance: "Журнал посещаемости группы",
    }
  }
};
