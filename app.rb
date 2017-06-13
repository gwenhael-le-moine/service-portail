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
  # domain: URL_ENT.gsub( /http[s]?:\/\//, '' ),
  # path: APP_PATH

  use OmniAuth::Builder do
    configure do |config|
      config.path_prefix = '/auth'
      config.full_host = CASAUTH::CONFIG[:full_host] if ENV['RACK_ENV'] == 'production'
    end
    provider :cas, CASAUTH::CONFIG
  end

  configure :production, :development do
    set :sessions, true
    set :protection, true
    set :protection, except: :frame_options
    set :show_exceptions, false
  end

  ##### routes #################################################################

  before do
    pass if request.path =~ %r{#{APP_PATH}/(auth|login|status)/}

    cache_control :no_cache

    redirect "#{APP_PATH}/auth/cas/?url=#{request.env['REQUEST_PATH']}/" unless env['rack.session'][:authenticated]
  end

  register LaClasse::Routes::Auth

  register Portail::Routes::Index

  register Portail::Routes::Stats
end
