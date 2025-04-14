import 'package:english_words/english_words.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'dart:math';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => MyAppState(),
      child: MaterialApp(
        title: 'Namer App',
        theme: ThemeData(
          useMaterial3: true,
          colorScheme:
              ColorScheme.fromSeed(seedColor: Color.fromRGBO(40, 42, 54, 1)),
        ),
        home: MyHomePage(),
      ),
    );
  }
}

class MyAppState extends ChangeNotifier {
  WordPair current = WordPair.random();

  void getNext() {
    current = WordPair.random();
    notifyListeners();
  }

  Future<void> loadPair() async {
    final dio = Dio();
    const pokemon = <String>[
      'slowbro',
      'smeargle',
      'pikachu',
      'ditto',
      'lapras'
    ];
    final rng = Random();
    final index = rng.nextInt(pokemon.length);
    var response =
        await dio.get('https://pokeapi.co/api/v2/pokemon/${pokemon[index]}');
    current = WordPair(
      response.data['abilities'][0]['ability']['name'],
      response.data['abilities'][1]['ability']['name'],
    );
    notifyListeners();
  }

  var favorites = <WordPair>[];

  toggleFavorite() {
    var toggleFn =
        favorites.contains(current) ? favorites.remove : favorites.add;
    toggleFn(current);
    notifyListeners();
  }

  removeByIndex(int index) {
    favorites.removeAt(index);
    notifyListeners();
  }
}

// ...

class MyHomePage extends StatefulWidget {
  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    Widget selectedPage;
    switch (selectedIndex) {
      case 0:
        selectedPage = GeneratorPage();
      case 1:
        selectedPage = FavoritePage();
      default:
        selectedPage = Placeholder();
        break;
    }

    return Scaffold(
      body: Row(
        children: [
          SafeArea(
            child: NavigationRail(
              extended: false,
              destinations: [
                NavigationRailDestination(
                  icon: Icon(Icons.home),
                  label: Text('Home'),
                ),
                NavigationRailDestination(
                  icon: Icon(Icons.favorite),
                  label: Text('Favorites'),
                ),
              ],
              selectedIndex: selectedIndex,
              onDestinationSelected: (value) {
                setState(() => selectedIndex = value);
              },
            ),
          ),
          Expanded(
            child: Container(
              color: Theme.of(context).colorScheme.primaryContainer,
              child: selectedPage,
            ),
          ),
        ],
      ),
    );
  }
}

class GeneratorPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var appState = context.watch<MyAppState>();
    var pair = appState.current;

    IconData icon;
    if (appState.favorites.contains(pair)) {
      icon = Icons.favorite;
    } else {
      icon = Icons.favorite_border;
    }

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          BigCard(pair: pair),
          SizedBox(height: 10),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              ElevatedButton.icon(
                onPressed: () {
                  appState.toggleFavorite();
                },
                icon: Icon(icon),
                label: Text('Like'),
              ),
              SizedBox(width: 10),
              ElevatedButton(
                onPressed: () {
                  appState.loadPair();
                },
                child: Text('Next'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class BigCard extends StatelessWidget {
  const BigCard({
    super.key,
    required this.pair,
  });

  final WordPair pair;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final style = theme.textTheme.displayMedium!
        .copyWith(color: theme.colorScheme.onPrimary);
    return Card(
      color: theme.colorScheme.primary,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              pair.first.toLowerCase(),
              style: style,
              semanticsLabel: pair.asPascalCase,
            ),
            SizedBox(
              width: 2,
            ),
            Text(
              pair.second.toLowerCase(),
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: style.color,
                fontSize: style.fontSize,
              ),
              semanticsLabel: pair.asPascalCase,
            ),
          ],
        ),
      ),
    );
  }
}

class FavoritePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var appState = context.watch<MyAppState>();
    return ListView.separated(
      itemBuilder: (_, index) => ListTile(
        leading: Icon(Icons.favorite),
        title: Text(appState.favorites[index].asLowerCase),
        trailing: IconButton(
          icon: Icon(Icons.delete),
          onPressed: () => appState.removeByIndex(index),
        ),
      ),
      separatorBuilder: (_, __) => Divider(),
      itemCount: appState.favorites.length,
    );
  }
}
