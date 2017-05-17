# -*- encoding: utf-8 -*-

$LOAD_PATH.unshift(File.dirname(__FILE__))

require './config/init'

require 'laclasse/laclasse_logger'
require 'laclasse/utils/health_check'

require 'app'

LOGGER = Laclasse::LoggerFactory.get_logger
LOGGER.info "Démarrage du Portail avec #{LOGGER.loggers_count} logger#{LOGGER.loggers_count > 1 ? 's' : ''}"

Laclasse::Utils::HealthChecker.check

LOGGER.info 'Portail prêt à servir'

use Rack::Session::Cookie,
    key: 'rack.session',
    expire_after: SESSION_TIME,
    secret: SESSION_KEY
# path: '/portail',
# domain: URL_ENT.gsub( /http[s]?:\/\//, '' )

use OmniAuth::Builder do
  configure do |config|
    config.path_prefix = "#{APP_PATH}/auth"
    config.full_host = CASAUTH::CONFIG[:full_host] if ENV['RACK_ENV'] == 'production'
  end
  provider :cas, CASAUTH::CONFIG
end

LOGGER.debug "#{ENV['RACK_ENV']} environment"

map "#{APP_PATH}/" do
  run SinatraApp
end
