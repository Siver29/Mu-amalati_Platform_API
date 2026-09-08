FROM php:8.3-apache

# Install system dependencies and PHP extensions
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
    && a2enmod rewrite \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------
# Configure Apache MPM
# Make sure ONLY mpm_prefork is enabled
# ---------------------------------------------------------
RUN a2dismod mpm_event mpm_worker mpm_prefork || true \
    && rm -f \
        /etc/apache2/mods-enabled/mpm_event.load \
        /etc/apache2/mods-enabled/mpm_event.conf \
        /etc/apache2/mods-enabled/mpm_worker.load \
        /etc/apache2/mods-enabled/mpm_worker.conf \
        /etc/apache2/mods-enabled/mpm_prefork.load \
        /etc/apache2/mods-enabled/mpm_prefork.conf \
    && a2enmod mpm_prefork

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy Laravel project
COPY . .

# Install PHP dependencies
RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction

# Laravel permissions
RUN chown -R www-data:www-data \
    storage \
    bootstrap/cache

# ---------------------------------------------------------
# Configure Apache for Laravel
# Serve Laravel from /public
# ---------------------------------------------------------
RUN sed -i \
    's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|' \
    /etc/apache2/sites-available/000-default.conf

# Allow Laravel public directory
RUN printf '%s\n' \
    '<Directory /var/www/html/public>' \
    '    AllowOverride All' \
    '    Require all granted' \
    '</Directory>' \
    >> /etc/apache2/apache2.conf

# ---------------------------------------------------------
# Render configuration
# Render provides PORT=10000
# ---------------------------------------------------------
ENV PORT=10000

# Configure Apache to listen on port 10000
RUN sed -i 's/Listen 80/Listen 10000/' \
    /etc/apache2/ports.conf \
    && sed -i 's/:80>/:10000>/' \
    /etc/apache2/sites-available/000-default.conf

# Expose Render port
EXPOSE 10000

# Start Apache in foreground
CMD ["apache2-foreground"]