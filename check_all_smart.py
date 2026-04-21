import joblib
def check_all_in_smart():
    data = joblib.load('smart_assessment_model.pkl')
    print("Keys:", data.keys())
    for k, v in data.items():
        print(f"Key: {k}, Type: {type(v)}")
        if hasattr(v, 'n_features_in_'):
            print(f"  n_features_in_: {v.n_features_in_}")
        elif hasattr(v, 'vocabulary_'):
            print(f"  vocabulary_ size: {len(v.vocabulary_)}")

if __name__ == "__main__":
    check_all_in_smart()
