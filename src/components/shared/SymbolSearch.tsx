export default function SymbolSearch({ symbols, handleSymbol }: { symbols: any, handleSymbol: (symbol: string) => void }) {
  return (
    <>
      <div>
        <div className="absolute z-10 max-h-24 left-0 w-full px-4 overflow-auto rounded-md bg-lightGray text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {
            symbols && symbols.map((item: any) => (
              <div key={item.cmc_id} className="py-1 hover:bg-gray-light">
                <div className="flex items-center px-1" onClick={(e) => handleSymbol(item.symbol)} >
                  {item.cmc_id && <img src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${item.cmc_id}.png`} alt="" className="h-5 w-5 flex-shrink-0 rounded-full" />}
                  <span className={'font-normal ml-4 cursor-default'}>
                    {item.name}
                  </span>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </>
  )
}