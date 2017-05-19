# coding: utf-8

require 'rubygems'
require 'bundler'

Bundler.require( :default, ENV['RACK_ENV'].to_sym ) # require tout les gems définis dans Gemfile

require 'tilt/erb'

require_relative './config/init'

require_relative './routes/index'
require_relative './routes/auth'

require_relative './routes/stats'

# Application Sinatra servant de base
class SinatraApp < Sinatra::Base
  use Rack::Session::Cookie,
      expire_after: SESSION_TIME,
      secret: SESSION_KEY
  # path: '/portail',
  # domain: URL_ENT.gsub( /http[s]?:\/\//, '' )

  use OmniAuth::Builder do
    configure do |config|
      config.path_prefix = '/auth'
      config.full_host = CASAUTH::CONFIG[:full_host] if ENV['RACK_ENV'] == 'production'
    end
    provider :cas, CASAUTH::CONFIG
  end

  configure do
    set( :app_file, __FILE__ )
    set( :root, APP_ROOT )
    set( :public_folder, proc { File.join( root, 'public' ) } )
    set( :inline_templates, true )
    set( :protection, true )

    settings.add_charset << 'application/json'
  end

  ##### routes #################################################################

  before do
    pass if request.path =~ %r{#{APP_PATH}/(auth|login|status)/}

    cache_control :no_cache

    redirect "#{APP_PATH}/auth/cas/?url=#{URI.encode( request.path_info )}" unless env['rack.session'][:authenticated]
  end

  register Portail::Routes::Auth

  register Portail::Routes::Index

  register Portail::Routes::Stats
end
