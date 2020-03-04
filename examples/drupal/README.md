# Drupal example for development and testing server

This drupal is used for testing and development for `gatsby-drupal-webform` project.

## Usage

```sh
composer install

./vendor/bin/drush site-install gatsby_webform_testing --account-name='admin' --account-pass='admin' --db-url=sqlite:///tmp/site.sqlite -y -vvv
./vendor/bin/drush runserver
```
