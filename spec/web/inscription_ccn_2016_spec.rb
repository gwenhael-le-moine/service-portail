require_relative '../spec_helper'

feature SinatraApp do
  include Rack::Test::Methods

  it 'loads the page Inscription CCNs 2016-2017' do
    visit 'http://localhost:9292/portail/inscription_CCN_2016/index.html'

    expect( page ).to have_content 'PRÉ-INSCRIPTIONS POUR LA RENTRÉE 2016-2017 !'
  end
end
