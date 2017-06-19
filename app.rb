# coding: utf-8

require 'rubygems'
require 'bundler'

Bundler.require( :default, ENV['RACK_ENV'].to_sym ) # require tout les gems définis dans Gemfile

require 'tilt/erb'

require_relative './config/init'

require_relative './routes/index'

require_relative './routes/stats'

# Application Sinatra servant de base
class SinatraApp < Sinatra::Base

  configure :production, :development do
    set :protection, true
    set :protection, except: :frame_options
    set :show_exceptions, false
  end

  ##### routes #################################################################

  def logged?
    session = nil
    RestClient::Request.execute(
      method: :get,
      url: "#{ANNUAIRE[:url]}/sessions/current",
      headers: { cookie: env['HTTP_COOKIE'] },
      user: ANNUAIRE[:app_id],
      password: ANNUAIRE[:api_key]) do |response, request, result|
      session = JSON.parse(response) if response.code == 200
    end
    !session.nil? && session.key?('user')
  end

  def login!( route )
    unless route.empty?
      route += "?#{env['QUERY_STRING']}" unless env['QUERY_STRING'].empty?
      protocol = CASAUTH::CONFIG[:ssl] ? 'https' : 'http'
      route = URI.escape( "#{protocol}://#{env['HTTP_HOST']}#{route}" )
      redirect "/sso/login?service=#{URI.encode( route )}"
    end
    redirect "/sso/login"
  end

  before do
    cache_control :no_cache
    login! (request.env['REQUEST_PATH']) unless logged?
  end

  register Portail::Routes::Index

  register Portail::Routes::Stats
end
