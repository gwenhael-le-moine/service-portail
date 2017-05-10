require 'rspec'
require 'rack/test'
require 'capybara/rspec'
require 'capybara/poltergeist'

ENV['RACK_ENV'] = 'development'

require_relative '../config/init'
require_relative '../app'

RSpec.configure do |config|
  config.include Capybara::DSL
  config.include Capybara::RSpecMatchers
end

Capybara.app = Rack::Builder.new do eval File.read( 'config.ru' ) end # rubocop:disable Lint/Eval
Capybara.javascript_driver = :poltergeist

MOCKED_LOGGED_RACK_SESSION = { authenticated: true,
                               user: 'dummy',
                               current_user: { is_logged: true,
                                               uid: 'VAA60001',
                                               login: 'dummy',
                                               sexe: 'F',
                                               nom: 'Dummy',
                                               prenom: 'User',
                                               date_naissance: '01/02/1934',
                                               adresse: 'Nul part',
                                               code_postal: '69001',
                                               ville: 'Lyon',
                                               bloque: false,
                                               id_jointure_aaf: nil,
                                               avatar: 'https://v3dev.laclasse.com/api/default_avatar/avatar_feminin.svg',
                                               roles_max_priority_etab_actif: 'ADM_ETB',
                                               user_detailed: { 'profil_actif' => { 'structure_id' => '012345Z' } } },
                               extra: {},
                               info: {} }.freeze
