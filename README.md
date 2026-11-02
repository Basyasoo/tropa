<div align="center">

# Тропа

**Клиент для защищённого подключения на базе [Xray-core](https://github.com/XTLS/Xray-core)**

[![Последняя версия](https://img.shields.io/github/v/release/Basyasoo/tropa?style=flat-square&label=версия)](https://github.com/Basyasoo/tropa/releases/latest)
[![Android](https://img.shields.io/badge/Android-APK-3DDC84?style=flat-square&logo=android&logoColor=white)](https://github.com/Basyasoo/tropa/releases/latest/download/Tropa.apk)
[![Поддержка](https://img.shields.io/badge/Поддержка-Telegram-26A5E4?style=flat-square&logo=telegram&logoColor=white)](https://t.me/vpn_sus_sup)

</div>

В этом репозитории лежат только готовые сборки и сведения о релизах. Исходный код здесь не публикуется.

## Загрузки

| Платформа | Ссылка | Обновления |
|:----------|:-------|:-----------|
| Android (arm64) | [Скачать APK](https://github.com/Basyasoo/tropa/releases/latest/download/Tropa.apk) | В приложении |
| Windows (x64) | [Скачать ZIP](https://github.com/Basyasoo/tropa/releases/latest/download/Tropa-Windows.zip) | Вручную |
| iOS | Готовится | |

## Обновления

Приложение само проверяет новую версию при входе, показывает уведомление и скачивает обновление. На Android установку подтверждает пользователь: так работает система.

## Проверка файла

Скачивайте приложение только из раздела [Releases](https://github.com/Basyasoo/tropa/releases). Рядом с APK лежит `Tropa.apk.sha256`:

```bash
sha256sum -c Tropa.apk.sha256
```

Android откажется ставить обновление, подписанное другим ключом.

## Сообщить о проблеме

Пишите в поддержку: [@vpn_sus_sup](https://t.me/vpn_sus_sup). Об уязвимостях сообщайте туда же и не публикуйте их открыто до исправления.

## Состав

В приложении используются [Xray-core](https://github.com/XTLS/Xray-core) (MPL-2.0) и [tun2socks](https://github.com/xjasonlyu/tun2socks) (MIT). Права на эти компоненты принадлежат их авторам.
