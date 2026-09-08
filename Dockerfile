FROM php:8.3-apache

# ---------------------------------------------------------
# System dependencies + PHP extensions
# ---------------------------------------------------------
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-install \
        pdo_pgsql \
        pgsql \
        mbstring \
        bcmath \
        intl \
        zip \
        xml \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------
# Apache: remove ALL MPM modules and enable ONLY prefork
# ---------------------------------------------------------
RUN rm -f /etc/apache2/mods-enabled/mpm_event.load \
          /etc/apache2/mods-enabled/mpm_event.conf \
          /etc/apache2/mods-enabled/mpm_worker.load \
          /etc/apache2/mods-enabled/mpm_worker.conf \
          /etc/apache2/mods-enabled/mpm_prefork.load \
          /etc/apache2/mods-enabled/mpm_prefork.conf \
    && a2enmod mpm_prefork \
    && a2enmod rewrite

# ---------------------------------------------------------
# Install Composer
# ---------------------------------------------------------
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# ---------------------------------------------------------
# Laravel
# ---------------------------------------------------------
WORKDIR /var/www/html

COPY . .

RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction

# ---------------------------------------------------------
# Laravel permissions
# ---------------------------------------------------------
RUN chown -R www-data:www-data \
    storage \
    bootstrap/cache

# ---------------------------------------------------------
# Apache VirtualHost
# ---------------------------------------------------------
RUN sed -i \
    's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|' \
    /etc/apache2/sites-available/000-default.conf

# ---------------------------------------------------------
# Laravel public directory permissions
# ---------------------------------------------------------
RUN printf '%s\n' \
    '<Directory /var/www/html/public>' \
    '    AllowOverride All' \
    '    Require all granted' \
    '</Directory>' \
    >> /etc/apache2/apache2.conf

# ---------------------------------------------------------
# Render port
# ---------------------------------------------------------
ENV PORT=10000

RUN sed -i 's/Listen 80/Listen 10000/' \
    /etc/apache2/ports.conf \
    && sed -i 's/:80>/:10000>/' \
    /etc/apache2/sites-available/000-default.conf

EXPOSE 10000

# ---------------------------------------------------------
# Start Apache
# ---------------------------------------------------------
CMD ["apache2-foreground"]