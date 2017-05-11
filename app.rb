# coding: utf-8

require 'rubygems'
require 'bundler'
require 'sinatra/json'
require 'open-uri'
require 'htmlentities'
require 'uri'
require 'json'
require 'yaml'
require 'date'

Bundler.require( :default, ENV['RACK_ENV'].to_sym ) # require tout les gems définis dans Gemfile

require 'tilt/erb'

require 'laclasse/helpers/authentication'
require 'laclasse/helpers/user'
require 'laclasse/helpers/app_infos'

require_relative './routes/index'
require_relative './routes/auth'
require_relative './routes/status'

require_relative './routes/stats'

# Application Sinatra servant de base
class SinatraApp < Sinatra::Base
  configure do
    set( :app_file, __FILE__ )
    set( :root, APP_ROOT )
    set( :public_folder, proc { File.join( root, 'public' ) } )
    set( :inline_templates, true )
    set( :protection, true )

    settings.add_charset << 'application/json'
  end

  helpers Sinatra::Param

  helpers Laclasse::Helpers::Authentication
  helpers Laclasse::Helpers::User
  helpers Laclasse::Helpers::AppInfos

  ##### routes #################################################################

  before  do
    pass if request.path =~ %r{#{APP_PATH}/(auth|login|status)/}

    cache_control :no_cache

    login!( request.path_info ) unless logged?
  end

  register Portail::Routes::Index
  register Portail::Routes::Status
  register Portail::Routes::Stats

  register Portail::Routes::Auth
end

SinatraApp.run! if __FILE__ == $PROGRAM_NAME
